#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const zip=path.resolve(process.argv[2]||'artifacts/living-city-v021/crisis-vector-living-city-v021.zip');
const output=path.resolve(process.argv[3]||'/tmp/living-city-v021-package-check.json');
(async()=>{
  const names=execFileSync('unzip',['-Z','-1',zip],{encoding:'utf8'}).trim().split('\n');
  assert.ok(names.every(n=>!path.isAbsolute(n)&&!n.split(/[\\/]/).includes('..')),'Unsafe archive entry');
  const stage=fs.mkdtempSync(path.join(os.tmpdir(),'living-city-package-'));
  execFileSync('unzip',['-q',zip,'-d',stage]);
  const server=http.createServer((req,res)=>{
    const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,''),candidate=path.resolve(stage,relative||'index.html');
    if(!candidate.startsWith(stage+path.sep)&&candidate!==stage){res.writeHead(403);res.end();return;}
    const file=candidate.endsWith(path.sep)||fs.existsSync(candidate)&&fs.statSync(candidate).isDirectory()?path.join(candidate,'index.html'):candidate;
    if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
    const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
    const url=`http://127.0.0.1:${server.address().port}/living-city/`;
    await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>window.livingDemo?.ready===true);
    await page.evaluate(()=>livingDemo.setPaused(true));await context.setOffline(true);
    assert.equal(await page.evaluate(()=>livingDemo.version),'0.2.1');
    const scenarios=[];
    for(const scenario of ['S0','S1','S2']){
      const result=await page.evaluate(scenario=>{
        livingDemo.reset({scenario,seed:16927});
        let s=livingDemo.getState(),caseId=scenario==='S0'?null:s.initialPersonId;
        for(let elapsed=0;elapsed<6000;elapsed+=50){
          s=livingDemo.advanceTicks(50);
          if(!caseId)caseId=s.incidents.find(i=>i.type==='medical')?.personId;
          const medical=s.incidents.find(i=>i.type==='medical'&&i.personId===caseId);
          if(scenario==='S0'&&s.events.some(e=>e.type==='PatientAdmitted'&&e.personId===caseId))break;
          if(scenario==='S1'&&s.events.some(e=>e.type==='PatientAssessed'&&e.incidentId===medical?.id))break;
          if(scenario==='S2'&&s.events.some(e=>e.type==='ShotFired'))break;
        }
        const medical=s.incidents.find(i=>i.type==='medical'&&i.personId===caseId);
        return {scenario,tick:s.tick,total:s.people.length,counters:s.counters,
          patient:s.people.find(p=>p.id===caseId),origin:medical?.origin??s.initialCaseOrigin,
          admitted:s.events.filter(e=>e.type==='PatientAdmitted').map(e=>e.personId),
          assessed:s.events.some(e=>e.type==='PatientAssessed'&&e.incidentId===medical?.id),
          shots:s.events.filter(e=>e.type==='ShotFired').length,webgl2:livingDemo.getMetrics().webgl2,timeScale:livingDemo.getTimeState()};
      },scenario);
      assert.equal(result.total,164);assert.equal(result.counters.living+result.counters.dead,164);assert.equal(result.webgl2,true);
      if(scenario==='S0')assert.ok(result.admitted.includes(result.patient.id));
      if(scenario==='S1')assert.ok(result.assessed,'The organic progressive case needs a physical medical assessment');
      if(scenario==='S0')assert.equal(result.counters.reanimatedHistorical,0);
      if(scenario==='S2')assert.ok(result.shots>0);
      scenarios.push(result);
    }
    await page.evaluate(()=>{livingDemo.reset({scenario:'S0'});let s;for(let i=0;i<120;i++){s=livingDemo.advanceTicks(25);if(s.incidents.some(c=>c.type==='medical'&&c.reportedAt!=null))break;}const c=s.incidents.find(c=>c.type==='medical'&&c.reportedAt!=null);livingDemo.select({kind:c?'incident':'person',id:c?.id??s.initialPersonId});livingDemo.renderer.rotateCamera(1);});
    const desktopShot=path.join(path.dirname(output),'living-city-v021-package-desktop.png');await page.screenshot({path:desktopShot});
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
    const mobile=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));assert.ok(mobile.documentWidth<=mobile.width);
    const mobileShot=path.join(path.dirname(output),'living-city-v021-package-mobile.png');await page.screenshot({path:mobileShot});
    assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,1,'Standalone runtime loaded external resources');
    const directPage=await context.newPage();let directFile;
    try{await directPage.goto('file://'+path.join(stage,'living-city/index.html'),{waitUntil:'load',timeout:10000});await directPage.waitForFunction(()=>window.livingDemo?.ready);directFile={status:'passed'};}
    catch(error){directFile={status:'unverified',reason:error.message.split('\n')[0]};}
    const report={schemaVersion:'living-city-package-check-v021',engineVersion:'0.2.1',status:'passed',generatedAt:new Date().toISOString(),browser:browser.version(),zipSHA256:crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex'),
      archiveEntries:names,standaloneRequestCount:requests.length,offlineAfterLoad:true,scenarios,mobile,errors,directFile,screenshots:{desktop:desktopShot,mobile:mobileShot}};
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,output,zipSHA256:report.zipSHA256,directFile}));
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(stage,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
