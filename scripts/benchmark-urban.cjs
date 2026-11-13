#!/usr/bin/env node
'use strict';

// Development-only instrumentation. Requires Playwright and a local Chromium;
// neither dependency is loaded by the game or its offline runtime.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');

const ROOT=path.resolve(__dirname,'..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const finite=values=>{
  assert.ok(Array.isArray(values),'Instrumentation samples must be arrays');
  assert.ok(values.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0),'Invalid instrumentation sample');
  return values;
};
function statistics(values) {
  const ordered=[...finite(values)].sort((a,b)=>a-b);
  const percentile=p=>ordered.length?ordered[Math.max(0,Math.ceil(p*ordered.length)-1)]:null;
  return {count:ordered.length,min:ordered[0]??null,max:ordered.at(-1)??null,
    mean:ordered.length?ordered.reduce((a,b)=>a+b,0)/ordered.length:null,
    p50:percentile(.5),p95:percentile(.95),p99:percentile(.99)};
}
function parseArguments(args) {
  const options={url:'http://127.0.0.1:8000/urban-spike/',output:'/tmp/crisis-vector-urban-benchmark.json',
    warmupMs:3000,captureMs:10000,repeats:3,width:1440,height:900,seed:16927,
    profiles:['P1','P2','P3'],dprs:[1,1.5,2],mode:'mixed',executablePath:'/usr/bin/chromium',smoke:true};
  const numbers={'--warmup-ms':'warmupMs','--capture-ms':'captureMs','--repeats':'repeats',
    '--width':'width','--height':'height','--seed':'seed'};
  const strings={'--url':'url','--output':'output','--mode':'mode','--chromium':'executablePath','--screenshot':'screenshot'};
  for(let i=0;i<args.length;i++) {
    const key=args[i];
    if(key==='--no-smoke'){options.smoke=false;continue;}
    const value=args[++i];assert.ok(value&&!value.startsWith('--'),`Missing value for ${key}`);
    if(Object.hasOwn(numbers,key)){const n=Number(value);assert.ok(Number.isSafeInteger(n)&&n>=0,`Invalid ${key}`);options[numbers[key]]=n;}
    else if(Object.hasOwn(strings,key))options[strings[key]]=value;
    else if(key==='--profiles')options.profiles=value.split(',');
    else if(key==='--dprs')options.dprs=value.split(',').map(Number);
    else throw new Error(`Unknown argument ${key}`);
  }
  assert.ok(options.captureMs>=500&&options.repeats>=1&&options.width>=640&&options.height>=480,'Capture, repeats or viewport too small');
  assert.ok(options.profiles.length&&options.profiles.every(p=>['P1','P2','P3'].includes(p)),'Invalid profile');
  assert.ok(options.dprs.length&&options.dprs.every(d=>[1,1.5,2].includes(d)),'Invalid DPR');
  assert.ok(['mixed','render'].includes(options.mode),'Mode must be mixed or render');
  const url=new URL(options.url);assert.ok(['http:','https:'].includes(url.protocol),'HTTP(S) app URL required');
  options.output=path.resolve(options.output);if(options.screenshot)options.screenshot=path.resolve(options.screenshot);
  return options;
}
function environment() {
  const read=file=>{try{return fs.readFileSync(file,'utf8').trim();}catch{return null;}};
  const git=args=>{try{return execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();}catch{return null;}};
  const files=[];
  function walk(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,e.name);if(e.isDirectory()&&e.name!=='node_modules')walk(file);
    else if(e.isFile()&&/\.(?:js|mjs|cjs|json|html|css)$/.test(e.name))files.push({file:path.relative(ROOT,file),sha256:sha256(fs.readFileSync(file))});
  }}
  walk(path.join(ROOT,'urban-spike'));
  return {platform:os.platform(),release:os.release(),architecture:os.arch(),node:process.version,
    cpuModels:[...new Set(os.cpus().map(c=>c.model))],visibleLogicalCpus:os.cpus().length,
    hostMemoryBytes:os.totalmem(),cgroupMemoryLimit:read('/sys/fs/cgroup/memory.max'),cgroupCpuQuota:read('/sys/fs/cgroup/cpu.max'),
    note:'Visible host CPU/RAM are not a reference desktop or a reservation of available resources. GPU/driver details use browser observations only.',
    gitCommit:git(['rev-parse','HEAD']),gitDirty:!!git(['status','--porcelain']),files};
}
async function pageFacts(page) {
  return page.evaluate(()=>{
    const canvas=document.querySelector('canvas'),gl=canvas?.getContext('webgl2');
    const ext=gl?.getExtension('WEBGL_debug_renderer_info');
    return {userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,
      deviceMemoryGiB:navigator.deviceMemory??null,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      canvas:canvas?{width:canvas.width,height:canvas.height,cssWidth:canvas.clientWidth,cssHeight:canvas.clientHeight}:null,
      webgl2:!!gl,webglVersion:gl?.getParameter(gl.VERSION)??null,
      glRenderer:gl?(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)):null,
      glVendor:gl?(ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR)):null,
      gpuTimerExtension:!!gl?.getExtension('EXT_disjoint_timer_query_webgl2'),
      performanceMemoryExposed:!!performance.memory};
  });
}
async function openPage(browser,options,dpr) {
  const context=await browser.newContext({viewport:{width:options.width,height:options.height},deviceScaleFactor:dpr});
  const page=await context.newPage(),pageErrors=[],failedRequests=[],externalRequests=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('requestfailed',request=>failedRequests.push({url:request.url(),failure:request.failure()?.errorText??null}));
  const origin=new URL(options.url).origin;
  page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==origin)externalRequests.push(request.url());});
  const started=performance.now();await page.goto(options.url,{waitUntil:'load',timeout:120000});
  await page.waitForFunction(()=>window.urbanDemo?.ready===true,null,{timeout:120000});
  return {context,page,pageErrors,failedRequests,externalRequests,initializationWallMs:performance.now()-started};
}
async function capture(page,durationMs) {
  return page.evaluate(duration=>new Promise(resolve=>{
    const frames=[],longTasks=[],started=performance.now();let previous=null,finished=false,observer;
    try {observer=new PerformanceObserver(list=>{for(const e of list.getEntries())longTasks.push({startTime:e.startTime,duration:e.duration});});observer.observe({entryTypes:['longtask']});}catch{}
    function finish(){if(finished)return;finished=true;observer?.disconnect();resolve({frameMs:frames,longTasks,captureWallMs:performance.now()-started});}
    function frame(now){if(finished)return;if(previous!==null)frames.push(now-previous);previous=now;if(performance.now()-started>=duration)finish();else requestAnimationFrame(frame);}
    requestAnimationFrame(frame);setTimeout(finish,duration+5000);
  }),durationMs);
}
async function heap(cdp) {
  try {const h=await cdp.send('Runtime.getHeapUsage');return {usedBytes:h.usedSize,totalBytes:h.totalSize,embedderHeapUsedBytes:h.embedderHeapUsedSize??null};}
  catch{return null;}
}
async function runCase(browser,options,{profile,dpr,repetition}) {
  const opened=await openPage(browser,options,dpr),{page,context}=opened;
  try {
    const cdp=await context.newCDPSession(page);
    const setup=await page.evaluate(({seed,profile})=>{
      const app=window.urbanDemo;app.setPaused(true);app.reset(seed);
      const before=JSON.stringify(app.getState()),started=performance.now();app.setProfile(profile);
      const profileBuildWallMs=performance.now()-started,profileDoesNotMutateState=before===JSON.stringify(app.getState());
      const state=app.getState(),commands=state.teams.map((team,i)=>({commandId:`benchmark-prime-${i}`,teamId:team.id,type:'perimeter',...state.mission.defensePoints[i]}));
      for(const command of commands){const result=app.command(command);if(!result.ok)throw new Error('Benchmark priming order rejected');}
      app.advanceTicks(300);app.resetMetrics?.();
      return {profileBuildWallMs,profileDoesNotMutateState,priming:{logicalTicks:300,simulatedSeconds:30,commands},metrics:app.getMetrics()};
    },{seed:options.seed,profile});
    assert.equal(setup.profileDoesNotMutateState,true,'Profile load changed logical state');
    const facts=await pageFacts(page);assert.equal(facts.webgl2,true,'WebGL2 is required for this benchmark');
    await page.evaluate(paused=>window.urbanDemo.setPaused(paused),options.mode==='render');
    await page.waitForTimeout(options.warmupMs);
    const before=await page.evaluate(()=>({metrics:window.urbanDemo.getMetrics(),state:window.urbanDemo.getState()})),heapBefore=await heap(cdp);
    assert.ok(Array.isArray(before.metrics.logicMs),'getMetrics().logicMs instrumentation is required');
    const measured=await capture(page,options.captureMs);
    const after=await page.evaluate(()=>{window.urbanDemo.setPaused(true);return {metrics:window.urbanDemo.getMetrics(),state:window.urbanDemo.getState()};});
    const heapAfter=await heap(cdp),samples=finite(after.metrics.logicMs).slice(before.metrics.logicMs.length);
    const renderSamples=finite(after.metrics.renderMs).slice(before.metrics.renderMs.length);
    assert.ok(measured.frameMs.length>0,'No rendered-frame intervals measured');
    if(options.mode==='mixed')assert.ok(samples.length>0,'Mixed workload produced no logic samples');
    assert.deepEqual(opened.pageErrors,[],'Browser script errors');assert.deepEqual(opened.failedRequests,[],'Failed local asset requests');
    assert.deepEqual(opened.externalRequests,[],'The standalone spike must not request external runtime assets');
    const frame=statistics(measured.frameMs),logic=statistics(samples),frameTotal=measured.frameMs.reduce((a,b)=>a+b,0);
    const {frameMs:discardFrame,logicMs:discardLogic,renderMs:discardRender,inputMs:discardInput,...rendererMetrics}=after.metrics;
    return {status:'measured',profile,dpr,repetition,mode:options.mode,
      initializationWallMs:opened.initializationWallMs,profileBuildWallMs:setup.profileBuildWallMs,priming:setup.priming,
      buildMeasurementNote:'Fresh browser-context/page initialization and explicit profile rebuilding; OS/file and browser shader caches may be warm.',
      facts,captureWallMs:measured.captureWallMs,frameMs:frame,logicCpuMs:logic,renderSubmissionCpuMs:statistics(renderSamples),
      sustainedRafFps:measured.frameMs.length*1000/frameTotal,
      framesAbove16_7ms:measured.frameMs.filter(v=>v>16.7).length,framesAbove33_3ms:measured.frameMs.filter(v=>v>33.3).length,
      framesAbove50ms:measured.frameMs.filter(v=>v>50).length,heapBefore,heapAfter,
      heapMeasurementNote:'CDP V8 heap snapshots, not total process/GPU memory or a measured peak.',
      gpuTimeMs:null,gpuTimeUnavailableReason:'No GPU timestamp-query duration instrumentation; extension presence does not provide measured GPU time.',
      rendererMetrics,stateBefore:before.state,stateAfter:after.state,
      raw:{frameMs:measured.frameMs,logicCpuMs:samples,renderSubmissionCpuMs:renderSamples,longTasks:measured.longTasks},pageErrors:opened.pageErrors};
  } finally {await context.close();}
}
async function smoke(browser,options,dpr) {
  const opened=await openPage(browser,options,dpr),{page,context}=opened;
  try {
    await page.evaluate(seed=>{window.urbanDemo.setPaused(true);window.urbanDemo.reset(seed);},options.seed);
    const before=await page.evaluate(()=>window.urbanDemo.getState()),picking=[];
    assert.ok(Array.isArray(before.teams)&&before.teams.length===2,'Expected two canonical teams');
    async function clickTeam(team,stage) {
      const projected=await page.evaluate(t=>window.urbanDemo.project(t.x,t.z),team);
      const point=Array.isArray(projected)?{x:projected[0],y:projected[1]}:projected;
      assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y),'Invalid screen projection');
      const started=performance.now();await page.mouse.click(point.x,point.y);
      await page.waitForFunction(id=>window.urbanDemo.getSelectedTeamId()===id,team.id,{timeout:5000});
      picking.push({teamId:team.id,stage,inputToSelectionWallMs:performance.now()-started,point});
    }
    for(const team of before.teams)await clickTeam(team,'initial');
    const canvas=page.locator('canvas').first(),box=await canvas.boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,-120);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    for(const team of before.teams)await clickTeam(team,'after-zoom');
    await page.setViewportSize({width:options.width+80,height:options.height+40});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    for(const team of before.teams)await clickTeam(team,'after-resize');
    assert.deepEqual(await page.evaluate(()=>window.urbanDemo.getState()),before,'Picking/camera/profile UI changed simulation');
    const pickingCallbackMs=await page.evaluate(()=>window.urbanDemo.getMetrics().inputMs);
    await context.setOffline(true);
    await page.evaluate(()=>window.urbanDemo.setPaused(false));
    await page.waitForFunction(tick=>window.urbanDemo.getState().tick>tick,before.tick,{timeout:10000});
    await page.evaluate(()=>window.urbanDemo.setPaused(true));
    await page.evaluate(seed=>window.urbanDemo.reset(seed),options.seed);
    const selected=before.teams[0];
    await page.locator(`[data-team="${before.teams[1].id}"]`).click();
    assert.equal(await page.evaluate(()=>window.urbanDemo.getSelectedTeamId()),before.teams[1].id,'Team card must select the second team');
    await page.locator(`[data-team="${selected.id}"]`).click();
    assert.equal(await page.evaluate(()=>window.urbanDemo.getSelectedTeamId()),selected.id,'Reset must select the first team');
    const destination=before.mission.defensePoints[0],point=await page.evaluate(p=>window.urbanDemo.project(p.x,p.z),destination);
    const uiOrders=[];
    for(const type of ['move','defend','perimeter','escort']) {
      await page.locator(`[data-order="${type}"]`).click();await page.mouse.click(point.x,point.y);
      const state=await page.evaluate(()=>window.urbanDemo.getState());
      assert.equal(state.acceptedCommands.at(-1).type,type);assert.equal(state.teams[0].x,selected.x,'Paused orders must not teleport teams');
      uiOrders.push(type);
    }
    await page.locator('[data-order="retreat"]').click();
    assert.equal(await page.evaluate(()=>window.urbanDemo.getState().acceptedCommands.at(-1).type),'retreat');uiOrders.push('retreat');
    await page.locator('[data-order="defend"]').click();await page.mouse.click(point.x,point.y,{button:'right'});
    assert.equal(await page.evaluate(()=>window.urbanDemo.getState().acceptedCommands.at(-1).type),'move','Right click must issue move');
    const outcomes=await page.evaluate(seed=>{
      const app=window.urbanDemo;app.reset(seed);app.advanceTicks(2100);const idle=app.getState();app.reset(seed);
      const initial=app.getState();for(let i=0;i<initial.teams.length;i++){
        const result=app.command({commandId:`smoke-protect-${i}`,teamId:initial.teams[i].id,type:'perimeter',...initial.mission.defensePoints[i]});
        if(!result.ok)throw new Error('Protection order rejected');
      }
      app.advanceTicks(700);return {idle,protectedAt70Seconds:app.getState()};
    },options.seed);
    if(options.screenshot&&dpr===options.dprs[0])await page.screenshot({path:options.screenshot,fullPage:true});
    const protectedOutcome=await page.evaluate(()=>{window.urbanDemo.advanceTicks(2100);return window.urbanDemo.getState();});
    assert.equal(outcomes.idle.phase,'failure');assert.equal(protectedOutcome.phase,'success');
    assert.ok(protectedOutcome.population.evacuated>=protectedOutcome.mission.evacTarget);
    assert.deepEqual(opened.pageErrors,[]);assert.deepEqual(opened.failedRequests,[]);assert.deepEqual(opened.externalRequests,[]);
    return {status:'passed',dpr,picking,pickingCallbackCpuMs:statistics(pickingCallbackMs),uiOrders,
      outcomes:{idle:outcomes.idle.mission.result,protected:protectedOutcome.mission.result},
      checks:['DPR-correct team picking','picking after camera zoom','picking after viewport resize','camera does not change canonical state','runtime advances without external network','five UI orders and right-click move','spatial protection succeeds while no-op fails'],facts:await pageFacts(page)};
  } finally {await context.close();}
}
async function runBenchmark(options) {
  const {chromium}=require('playwright');
  const browser=await chromium.launch({executablePath:options.executablePath,headless:true});
  const report={schemaVersion:'urban-spike-benchmark-v1',startedAt:new Date().toISOString(),classification:'preliminary_cloud_measurement',
    certification:'This cloud/software-renderer run does not certify 60 FPS on the reference desktop.',
    protocol:{executed:options,reference:{warmupMs:30000,captureMs:120000,repeats:3},percentileMethod:'nearest rank',
      referenceTimingComplete:options.warmupMs>=30000&&options.captureMs>=120000&&options.repeats>=3},
    environment:environment(),browser:{version:browser.version(),headless:true,executablePath:options.executablePath},smoke:[],runs:[]};
  const persist=()=>{fs.mkdirSync(path.dirname(options.output),{recursive:true});fs.writeFileSync(options.output,JSON.stringify(report,null,2)+'\n');};
  try {
    if(options.smoke)for(const dpr of options.dprs){const result=await smoke(browser,options,dpr);report.smoke.push(result);persist();console.log(`smoke DPR ${dpr}: passed`);}
    for(const profile of options.profiles)for(const dpr of options.dprs)for(let repetition=1;repetition<=options.repeats;repetition++) {
      const run=await runCase(browser,options,{profile,dpr,repetition});report.runs.push(run);persist();
      console.log(`${profile} DPR ${dpr} repetition ${repetition}: ${run.sustainedRafFps.toFixed(2)} FPS; frame p95 ${run.frameMs.p95.toFixed(3)} ms; logic p95 ${run.logicCpuMs.p95??'n/a'} ms`);
    }
    report.completedAt=new Date().toISOString();report.status='completed';persist();return report;
  } catch(error) {report.status='failed';report.failure=error.message;report.completedAt=new Date().toISOString();persist();throw error;}
  finally {await browser.close();}
}
module.exports={statistics,parseArguments,environment,runBenchmark,runCase,smoke};
if(require.main===module) {
  if(process.argv.includes('--help'))console.log('Usage: node scripts/benchmark-urban.cjs [--url URL] [--output FILE] [--warmup-ms 3000] [--capture-ms 10000] [--repeats 3] [--profiles P1,P2,P3] [--dprs 1,1.5,2] [--mode mixed|render] [--width 1440] [--height 900] [--screenshot FILE] [--no-smoke]');
  else runBenchmark(parseArguments(process.argv.slice(2))).then(report=>console.log(`Saved ${report.runs.length} measured runs to ${report.protocol.executed.output}`)).catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
}
