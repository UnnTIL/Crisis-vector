#!/usr/bin/env node
'use strict';
// Functional browser checks with a controlled RAF clock, not an FPS benchmark.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const options={url:null,output:'/tmp/living-city-v021-browser.json',screenshots:null};
for(let i=2;i<process.argv.length;i+=2){
  const key={'--url':'url','--output':'output','--screenshots':'screenshots'}[process.argv[i]];
  assert.ok(key&&process.argv[i+1],`Unknown or incomplete option ${process.argv[i]}`);
  options[key]=process.argv[i+1];
}
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const report={schemaVersion:'living-city-v021-browser-1',classification:'functional_checks_controlled_raf',
  startedAt:new Date().toISOString(),options,cases:[],timeScale:null,status:'running',
  limitations:['The browser clock controls requestAnimationFrame and timers; this is not a physical-GPU or 60 FPS measurement.',
    'The browser matrix runs 60 simulated seconds per seed/scenario; the separate logical reports cover longer simulation.',
    'Offline checks disable networking after all local assets have loaded. Direct file:// access depends on browser policy.']};
const save=()=>{fs.mkdirSync(path.dirname(path.resolve(options.output)),{recursive:true});fs.writeFileSync(options.output,JSON.stringify(report,null,2)+'\n');};
const near=(actual,expected,epsilon=1e-7,label='value')=>assert.ok(Math.abs(actual-expected)<=epsilon,`${label}: ${actual} != ${expected}`);
const angleDelta=(a,b)=>((a-b+540)%360)-180;
let server;
async function startServer(){
  server=http.createServer((req,res)=>{
    let relative;
    try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
    const target=path.resolve(root,'.'+relative+(relative.endsWith('/')?'index.html':''));
    if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    fs.readFile(target,(error,bytes)=>{
      if(error){res.writeHead(404).end();return;}
      const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'}[path.extname(target)]||'application/octet-stream';
      res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(bytes);
    });
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return `http://127.0.0.1:${server.address().port}/living-city/`;
}
const camera=page=>page.evaluate(()=>livingDemo.getMetrics().camera);
const stateJSON=page=>page.evaluate(()=>JSON.stringify(livingDemo.getState()));
const forceClick=(page,selector)=>page.locator(selector).click({force:true});
async function frames(page,milliseconds=34){await page.clock.runFor(milliseconds);}

async function checkCamera(page){
  const original=await stateJSON(page),start=await camera(page);
  assert.ok(Number.isFinite(start.azimuthDegrees),'Renderer must report azimuthDegrees');
  const step=start.rotationStepDegrees;
  assert.ok(Number.isFinite(step)&&step>0,'Renderer must report a finite rotation step');
  await page.locator('#livingCanvas').focus();
  await page.keyboard.press('q');await frames(page);
  const left=await camera(page);
  near(angleDelta(left.azimuthDegrees,start.azimuthDegrees),-step,1e-6,'Q rotation');
  near(left.target.x,start.target.x,1e-7,'rotation target x');near(left.target.z,start.target.z,1e-7,'rotation target z');
  await page.keyboard.press('e');await frames(page);
  near(angleDelta((await camera(page)).azimuthDegrees,start.azimuthDegrees),0,1e-6,'opposite key rotation');

  // These are actual keyboard events delivered to existing editable controls.
  for(const selector of ['#entity-search','#seed-input','#scenario-select']){
    await page.locator(selector).focus();
    const before=await camera(page);
    for(const key of ['q','e','r'])await page.keyboard.press(key);
    assert.deepEqual(await camera(page),before,`Camera shortcut fired while editing ${selector}`);
  }
  await page.locator('#entity-search').fill('');
  await page.locator('#livingCanvas').focus();await page.keyboard.press('q');await frames(page);
  const rotated=await camera(page),rect=await page.locator('#livingCanvas').boundingBox();
  const x=rect.x+rect.width*.55,y=rect.y+rect.height*.55;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+42,y+24,{steps:5});await page.mouse.up();await frames(page);
  const panned=await camera(page);
  assert.ok(Math.hypot(panned.target.x-rotated.target.x,panned.target.z-rotated.target.z)>.01,'Pan did not move camera after rotation');
  near(panned.azimuthDegrees,rotated.azimuthDegrees,1e-7,'pan preserved azimuth');
  await page.mouse.move(x,y);await page.mouse.wheel(0,-90);await frames(page);
  const zoomed=await camera(page);
  assert.ok(zoomed.zoom>panned.zoom,'Wheel zoom did not change camera after rotation/pan');
  near(zoomed.azimuthDegrees,panned.azimuthDegrees,1e-7,'zoom preserved azimuth');

  const hospital=await page.evaluate(()=>{const id=livingDemo.getState().facilities.hospital.buildingId;return {id,...livingDemo.renderer.projectEntity('building',id)};});
  assert.ok(hospital.visible,'Hospital must remain projectable after camera changes');
  await page.mouse.click(hospital.x,hospital.y);
  assert.deepEqual(await page.evaluate(()=>livingDemo.getSelection()),{kind:'building',id:hospital.id},'Picking hospital after rotation/pan/zoom');

  const personCandidates=await page.evaluate(()=>livingDemo.getState().people.filter(p=>p.location.kind==='street').map(p=>({id:p.id,...livingDemo.renderer.projectEntity('person',p.id)})).filter(p=>p.visible));
  let pickedPerson=null;
  for(const candidate of personCandidates.slice(0,24)){
    if(candidate.x<rect.x+15||candidate.x>rect.x+rect.width-15||candidate.y<rect.y+15||candidate.y>rect.y+rect.height-15)continue;
    await page.mouse.click(candidate.x,candidate.y);
    const selection=await page.evaluate(()=>livingDemo.getSelection());
    if(selection?.kind==='person'&&selection.id===candidate.id){pickedPerson=candidate.id;break;}
  }
  assert.ok(pickedPerson,'No drawn person could be picked at its projected position after rotation');

  const occupant=await page.evaluate(()=>livingDemo.getState().people.find(p=>p.location.kind==='building')?.id);
  assert.ok(occupant,'The roster must retain a person inside a building');
  await page.selectOption('#entity-select',`person:${occupant}`);
  await forceClick(page,'#select-entity-button');await forceClick(page,'#follow-button');await frames(page);
  assert.deepEqual((await page.evaluate(()=>livingDemo.getMetrics())).follow,{kind:'person',id:occupant});
  assert.match(await page.locator('#selection-note').innerText(),/interior/i,'Hidden occupant follow must explain the building marker');
  const followStart=await camera(page);
  await page.locator('#livingCanvas').focus();await page.keyboard.press('e');await frames(page);
  const followRotated=await camera(page);
  near(followRotated.target.x,followStart.target.x,1e-6,'follow rotation target x');near(followRotated.target.z,followStart.target.z,1e-6,'follow rotation target z');
  near(angleDelta(followRotated.azimuthDegrees,followStart.azimuthDegrees),step,1e-6,'E while following');
  await page.keyboard.press('r');await frames(page);
  const reset=await camera(page),metrics=await page.evaluate(()=>livingDemo.getMetrics());
  near(reset.azimuthDegrees,start.azimuthDegrees,1e-6,'R canonical orientation');near(reset.zoom,start.zoom,1e-7,'R canonical zoom');
  near(reset.target.x,start.target.x,1e-6,'R target x');near(reset.target.z,start.target.z,1e-6,'R target z');
  assert.equal(metrics.follow,null,'R must stop following');
  assert.equal(await stateJSON(page),original,'Camera, picking or follow mutated canonical state');
  return {rotationStepDegrees:step,rotation:true,shortcutsIgnoredInEditableControls:true,panZoomAfterRotation:true,
    hospitalPicking:true,personPicking:pickedPerson,hiddenOccupantFollow:occupant,followRotation:true,resetOrientation:true,canonicalHash:hash(original)};
}

async function checkInterpolation(page){
  const proof=await page.evaluate(()=>{
    const api=livingDemo,renderer=api.renderer;
    let before=api.getState(),after,movingPerson,movingVehicle;
    for(let i=0;i<30;i++){
      after=api.advanceTicks(1);
      movingPerson=after.people.find(p=>{
        const old=before.people.find(a=>a.id===p.id);
        return p.location.kind==='street'&&old?.location.kind==='street'&&p.lifeState===old.lifeState&&Math.hypot(p.x-old.x,p.z-old.z)>.00001;
      });
      movingVehicle=after.vehicles.find(v=>{const old=before.vehicles.find(a=>a.id===v.id);return old&&Math.hypot(v.x-old.x,v.z-old.z)>.00001;});
      if(movingPerson&&movingVehicle)break;
      before=after;
    }
    if(!movingPerson||!movingVehicle)throw new Error('No consecutive moving person/vehicle poses available for interpolation check');
    const canonical=JSON.stringify(api.getState()),results=[];
    for(const [kind,entity] of [['person',movingPerson],['vehicle',movingVehicle]]){
      // A detached state with stable identity proves visual interpolation without editing domain state.
      const probe=structuredClone(before);renderer.snapToState(probe);Object.assign(probe,structuredClone(after));renderer.captureTick(probe);
      const points=[];
      for(const alpha of [0,.5,1]){renderer.render(probe,alpha);points.push(renderer.getVisualPose(kind,entity.id));}
      results.push({kind,id:entity.id,points});
    }
    return {results,canonicalUnchanged:canonical===JSON.stringify(api.getState())};
  });
  assert.ok(proof.canonicalUnchanged,'Interpolation writes canonical state');
  for(const {kind,points:[previous,middle,current]} of proof.results){
    assert.ok(previous&&middle&&current,`Missing drawn ${kind} pose`);
    assert.ok(Math.hypot(current.x-previous.x,current.z-previous.z)>.00001,`No movement interpolated for ${kind}`);
    near(middle.x,(previous.x+current.x)/2,1e-6,`${kind} midpoint x`);
    near(middle.z,(previous.z+current.z)/2,1e-6,`${kind} midpoint z`);
    assert.equal(middle.hidden,false,`Moving ${kind} should be drawn`);
  }
  return proof;
}

async function checkPause(page){
  await page.evaluate(()=>livingDemo.setPaused(false));await frames(page,137);
  await page.evaluate(()=>livingDemo.setPaused(true));
  const before=await page.evaluate(()=>{
    const state=livingDemo.getState(),person=state.people.find(p=>p.location.kind==='street');
    return {state:JSON.stringify(state),id:person.id,pose:livingDemo.renderer.getVisualPose('person',person.id),time:livingDemo.getTimeState()};
  });
  await frames(page,251);
  const after=await page.evaluate(id=>({state:JSON.stringify(livingDemo.getState()),pose:livingDemo.renderer.getVisualPose('person',id),time:livingDemo.getTimeState()}),before.id);
  assert.equal(after.state,before.state,'Paused simulation advanced');
  assert.deepEqual(after.pose,before.pose,'Paused interpolation introduced phantom movement');
  assert.equal(after.time.paused,true);
  const tick=after.time.tick;await forceClick(page,'#step-button');
  assert.equal(await page.evaluate(()=>livingDemo.getState().tick),tick+1,'Single-step button must advance exactly one logical tick');
  assert.equal(await page.evaluate(()=>livingDemo.isPaused),true,'Single step must leave simulation paused');
  return {phantomMovement:false,canonicalHash:hash(after.state),pausedTicks:after.time.tick,singleStepTicks:1};
}

async function checkTimeScale(page){
  const rates=[];
  for(const speed of [1,2,4]){
    await page.evaluate(()=>livingDemo.reset({seed:16927,scenario:'S0'}));
    await forceClick(page,`[data-speed="${speed}"]`);
    await page.evaluate(()=>livingDemo.setPaused(false));
    assert.equal(await page.locator('#step-button').isDisabled(),true,'Single-step button must be disabled while running');
    const start=await page.evaluate(()=>({real:performance.now(),time:livingDemo.getTimeState()}));
    await frames(page,1000);
    const end=await page.evaluate(()=>({real:performance.now(),time:livingDemo.getTimeState()}));
    await page.evaluate(()=>livingDemo.setPaused(true));
    const deltaTicks=end.time.tick-start.time.tick;
    assert.equal(start.time.baseSimulationRate,2);assert.equal(start.time.speed,speed);
    assert.equal(start.time.logicalSecondsPerRealSecond,2*speed);
    assert.ok(Math.abs(deltaTicks-20*speed)<=1,`Speed ${speed}× advanced ${deltaTicks}; expected ${20*speed} ticks ± one RAF boundary tick`);
    near(end.real-start.real,1000,.001,'Controlled real milliseconds');
    rates.push({speed,simulatedSecondsPerRealSecond:2*speed,realMilliseconds:end.real-start.real,deltaTicks,accumulatorMs:end.time.accumulatorMs});
  }
  assert.match(await page.locator('#time-scale-note').innerText(),/1.*2.*simulad/i,'Visible base-rate legend');
  return {baseSimulationRate:2,rates,clock:'Playwright controlled RAF'};
}

async function runCase(browser,url,{seed,scenario,dpr},index){
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr});
  const page=await context.newPage(),errors=[],failedRequests=[],externalRequests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>failedRequests.push({url:request.url(),failure:request.failure()?.errorText}));
  page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==new URL(url).origin)externalRequests.push(request.url());});
  try{
    const epoch=new Date('2026-11-14T00:00:00Z');
    await page.clock.install({time:epoch});await page.clock.pauseAt(new Date(epoch.getTime()+1000));
    await page.goto(url,{waitUntil:'load',timeout:120000});
    assert.equal(await page.evaluate(()=>window.livingDemo?.ready),true,'Living City did not initialize');
    await context.setOffline(true);
    await page.locator('#seed-input').fill(String(seed));await page.selectOption('#scenario-select',scenario);await forceClick(page,'#reset-button');await frames(page);
    const start=await page.evaluate(()=>livingDemo.getState());
    assert.equal(start.seed,seed);assert.equal(start.scenario,scenario);assert.equal(start.tick,0);
    const result={seed,scenario,dpr,status:'running',offlineAfterLoad:true};
    result.camera=await checkCamera(page);
    result.pause=await checkPause(page);
    await page.evaluate(({seed,scenario})=>livingDemo.reset({seed,scenario}),{seed,scenario});
    result.interpolation=await checkInterpolation(page);
    if(index===0)report.timeScale=await checkTimeScale(page);
    await page.evaluate(({seed,scenario})=>livingDemo.reset({seed,scenario}),{seed,scenario});
    const final=await page.evaluate(()=>livingDemo.advanceTicks(600));
    assert.equal(final.tick,600);assert.equal(final.people.length,start.people.length);
    assert.deepEqual(final.people.map(p=>p.id),start.people.map(p=>p.id),'Presentation introduced identities');
    assert.equal(final.counters.living+final.counters.dead,final.initialPopulation);
    if(scenario==='S0')assert.equal(final.counters.reanimatedHistorical,0,'S0 created a zombie');
    result.logical={ticks:final.tick,simulatedSeconds:final.timeSeconds,people:final.people.length,counters:final.counters,hash:hash(JSON.stringify(final))};
    result.metrics=await page.evaluate(()=>{const m=livingDemo.getMetrics();return {dpr:m.dpr,resolution:m.resolution,gpu:m.gpu,renderer:m.renderer,camera:m.camera};});
    assert.equal(result.metrics.dpr,dpr,'Renderer DPR mismatch');
    const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i)}));
    assert.equal(layout.scrollWidth,layout.width,'Desktop horizontal overflow');assert.deepEqual(layout.duplicateIds,[]);
    if(options.screenshots){fs.mkdirSync(path.resolve(options.screenshots),{recursive:true});result.screenshot=path.resolve(options.screenshots,`living-city-v021-${scenario}-${seed}-dpr${dpr}.png`);await page.screenshot({path:result.screenshot});}
    assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(failedRequests,[],'Failed requests');assert.deepEqual(externalRequests,[],'External HTTP dependencies');
    result.status='passed';result.errors=errors;result.failedRequests=failedRequests;result.externalRequests=externalRequests;
    return result;
  }finally{await context.close();}
}

(async()=>{
  const url=options.url||await startServer();report.testedURL=url;
  const bundle=path.join(root,'living-city/demo.js');assert.ok(fs.existsSync(bundle),'Build living-city/demo.js before running browser checks');
  report.bundleSHA256=hash(fs.readFileSync(bundle));
  const buildFile=path.join(root,'living-city/build-info.json');
  if(fs.existsSync(buildFile)){
    const build=JSON.parse(fs.readFileSync(buildFile));
    for(const file of build.files)assert.equal(hash(fs.readFileSync(path.join(root,file.path))),file.sha256,`Rebuild changed source ${file.path}`);
    report.sourceFiles=build.files;
  }
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true});
  try{
    report.browserVersion=browser.version();let index=0;
    for(const [scenarioIndex,scenario] of ['S0','S1','S2'].entries())for(const [seedIndex,seed] of [16927,42,2026].entries()){
      const dpr=[1,1.5,2][(scenarioIndex+seedIndex)%3];
      report.cases.push(await runCase(browser,url,{seed,scenario,dpr},index++));save();
      console.log(`${scenario} seed ${seed} DPR ${dpr}: passed camera, pause, interpolation and offline flow`);
    }
    assert.equal(report.cases.length,9);report.status='completed';report.completedAt=new Date().toISOString();save();
  }finally{await browser.close();}
})().catch(error=>{report.status='failed';report.failure=error.stack;report.completedAt=new Date().toISOString();save();console.error(error);process.exitCode=1;}).finally(()=>server?.close());
