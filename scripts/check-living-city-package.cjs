#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const zip=path.resolve(process.argv[2]||'artifacts/living-city-v02/crisis-vector-living-city-v02.zip');
const output=path.resolve(process.argv[3]||'/tmp/living-city-package-check.json');
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
    const scenarios=[];
    for(const scenario of ['S0','S1','S2']){
      const result=await page.evaluate(scenario=>{
        livingDemo.reset({scenario,seed:16927});livingDemo.advanceTicks(scenario==='S2'?1000:1200);
        const s=livingDemo.getState();return {scenario,tick:s.tick,total:s.people.length,counters:s.counters,
          patient:s.people.find(p=>p.id===s.initialPersonId),admitted:s.events.filter(e=>e.type==='PatientAdmitted').map(e=>e.personId),
          shots:s.events.filter(e=>e.type==='ShotFired').length,webgl2:livingDemo.getMetrics().webgl2};
      },scenario);
      assert.equal(result.total,164);assert.equal(result.counters.living+result.counters.dead,164);assert.equal(result.webgl2,true);
      if(scenario==='S0'||scenario==='S1')assert.ok(result.admitted.includes(result.patient.id));
      if(scenario==='S0')assert.equal(result.counters.reanimatedHistorical,0);
      if(scenario==='S2')assert.ok(result.shots>0);
      scenarios.push(result);
    }
    await page.evaluate(()=>{livingDemo.reset({scenario:'S0'});livingDemo.advanceTicks(600);const s=livingDemo.getState();livingDemo.select({kind:'person',id:s.initialPersonId});livingDemo.follow(true);});
    const desktopShot=path.join(path.dirname(output),'living-city-package-desktop.png');await page.screenshot({path:desktopShot});
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
    const mobile=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));assert.ok(mobile.documentWidth<=mobile.width);
    const mobileShot=path.join(path.dirname(output),'living-city-package-mobile.png');await page.screenshot({path:mobileShot});
    assert.equal(errors.length,0,errors.join('\n'));assert.equal(requests.length,1,'Standalone runtime loaded external resources');
    const directPage=await context.newPage();let directFile;
    try{await directPage.goto('file://'+path.join(stage,'living-city/index.html'),{waitUntil:'load',timeout:10000});await directPage.waitForFunction(()=>window.livingDemo?.ready);directFile={status:'passed'};}
    catch(error){directFile={status:'unverified',reason:error.message.split('\n')[0]};}
    const report={status:'passed',generatedAt:new Date().toISOString(),browser:browser.version(),zipSHA256:crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex'),
      archiveEntries:names,standaloneRequestCount:requests.length,offlineAfterLoad:true,scenarios,mobile,errors,directFile,screenshots:{desktop:desktopShot,mobile:mobileShot}};
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,output,zipSHA256:report.zipSHA256,directFile}));
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(stage,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
