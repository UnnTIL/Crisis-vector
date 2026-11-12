/* Crisis Vector — browser presentation layer. World and city share one simulation state. */
(() => {
  'use strict';
  const { SimEngine, UNIT_TYPES, POLICY_TYPES, FINANCE_RULES, clamp, fmt } = window.CrisisSim;
  const el = id => document.getElementById(id);
  const worldCanvas=el('worldCanvas'),cityCanvas=el('cityCanvas');
  const wctx=worldCanvas.getContext('2d'),cctx=cityCanvas.getContext('2d');
  let sim = new SimEngine(window.WORLD_DATA);
  let selected='PRT',hovered=null,view='world',playing=false,speed=1,selectedUnit='squad';
  let w=1000,h=480,dpr=1,paths=new Map(),lastTick=0,lastDraw=0,lastPaintTime=0,toastTimer=null;
  let currentCityCache=null;
  const AREA=el('mapArea');
  const CONTINENTS={'Africa':'ÁFRICA','Asia':'ÁSIA','Europe':'EUROPA','North America':'AMÉRICA DO NORTE','South America':'AMÉRICA DO SUL','Oceania':'OCEÂNIA','Antarctica':'ANTÁRTIDA','Seven seas (open ocean)':'OCEANO'};
  const LABELS={USA:'EUA',BRA:'BRASIL',RUS:'RÚSSIA',CHN:'CHINA',IND:'ÍNDIA',AUS:'AUSTRÁLIA',CAN:'CANADÁ',ESP:'ESPANHA',PRT:'PT',DEU:'ALEMANHA',FRA:'FRANÇA',ZAF:'ÁFRICA DO SUL'};
  const ROUTES=[['IND','CHN'],['IND','TUR'],['ESP','PRT'],['ESP','FRA'],['FRA','GBR'],['BRA','USA'],['CHN','JPN'],['USA','GBR'],['TUR','DEU'],['ZAF','BRA']];
  const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const compact = n => {
    if(n>=1e9)return (n/1e9).toLocaleString('pt-PT',{maximumFractionDigits:2})+' mil M';
    if(n>=1e6)return (n/1e6).toLocaleString('pt-PT',{maximumFractionDigits:2})+' M';
    if(n>=1e4)return (n/1000).toLocaleString('pt-PT',{maximumFractionDigits:1})+' mil';
    return fmt(Math.round(n));
  };
  const money = (n,digits=2)=>Number(n).toLocaleString('pt-PT',{minimumFractionDigits:digits,maximumFractionDigits:digits})+' B€';
  function project(p){const lon=p[0],lat=p[1]; return [(lon+180)/360*w,(81-lat)/141*h];}
  function size(){
    const r=AREA.getBoundingClientRect(); const nw=Math.max(300,r.width),nh=Math.max(260,r.height);
    const ndpr=Math.min(2,window.devicePixelRatio||1);
    if(w===nw&&h===nh&&dpr===ndpr)return;
    w=nw;h=nh;dpr=ndpr;
    for(const c of [worldCanvas,cityCanvas]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
    wctx.setTransform(dpr,0,0,dpr,0,0);cctx.setTransform(dpr,0,0,dpr,0,0);
    makePaths();currentCityCache=null;
  }
  function makePaths(){
    paths=new Map();
    for(const country of sim.countries){
      const path=new Path2D();
      for(const ring of country.rings){
        let last=null;
        for(const pos of ring){const [x,y]=project(pos);
          if(!last || Math.abs(x-last[0])>w*.47)path.moveTo(x,y);
          else path.lineTo(x,y);
          last=[x,y];
        }
        path.closePath();
      }
      paths.set(country.id,path);
    }
  }
  function worldColor(c){
    if(!c.cases)return '#1b2c3a';
    const ratio=c.cases/c.pop;
    if(ratio<.000001)return '#3d606d';
    if(ratio<.00002)return '#628689';
    if(ratio<.0002)return '#d3a474';
    if(ratio<.003)return '#c77c64';
    if(ratio<.02)return '#b95555';
    return '#7f2939';
  }
  function drawWorld(time){
    const ctx=wctx;ctx.clearRect(0,0,w,h);
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#0e2232');bg.addColorStop(1,'#09151f');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.beginPath();ctx.lineWidth=.6;ctx.strokeStyle='#21415380';
    for(let lon=-150;lon<=150;lon+=30){let x=project([lon,0])[0];ctx.moveTo(x,0);ctx.lineTo(x,h);}
    for(let lat=-60;lat<=60;lat+=20){let y=project([0,lat])[1];ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();
    for(const c of sim.countries){
      const path=paths.get(c.id);if(!path)continue;
      ctx.fillStyle=worldColor(c);ctx.fill(path);
      ctx.lineWidth=.68;ctx.strokeStyle='#3b5161';ctx.stroke(path);
    }
    for(const [from,to] of ROUTES){
      const a=sim.getCountry(from),b=sim.getCountry(to);
      if(!a||!b||a.cases<200||b.cases<20)continue;
      const [x1,y1]=project(a.center),[x2,y2]=project(b.center),mx=(x1+x2)/2,my=(y1+y2)/2-25-Math.min(30,Math.abs(x2-x1)*.08);
      ctx.strokeStyle='rgba(232,138,113,.25)';ctx.lineWidth=.95;ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(mx,my,x2,y2);ctx.stroke();ctx.setLineDash([]);
      const t=(time*.00012+from.charCodeAt(0)*.028)%1;
      const xp=(1-t)**2*x1+2*(1-t)*t*mx+t*t*x2,yp=(1-t)**2*y1+2*(1-t)*t*my+t*t*y2;
      ctx.beginPath();ctx.arc(xp,yp,2.2,0,Math.PI*2);ctx.fillStyle='#e1aa8a';ctx.fill();
    }
    for(const c of sim.countries){
      if(c.cases<150)continue;
      const [x,y]=project(c.center);if(x<1||x>w-1||y<10||y>h-8)continue;
      const rad=2.7+Math.min(9,Math.log10(c.cases+1)*1.2);
      const pulse=(Math.sin(time*.003+(c.center[0]+180)*.1)+1)*.5;
      ctx.beginPath();ctx.arc(x,y,rad+4+pulse*6,0,Math.PI*2);ctx.fillStyle='rgba(239,104,94,.07)';ctx.fill();
      ctx.beginPath();ctx.arc(x,y,rad*.5,0,Math.PI*2);ctx.fillStyle='#ef9783';ctx.fill();
    }
    ctx.font='700 9px Inter,Segoe UI,Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    for(const id of Object.keys(LABELS)){
      const c=sim.getCountry(id);if(!c||id===selected)continue;
      let [x,y]=project(c.center);if(id==='RUS')x-=25;if(id==='USA')x+=18;if(id==='CAN')y-=12;
      ctx.fillStyle='rgba(174,201,213,.6)';ctx.fillText(LABELS[id],x,y+13);
    }
    const focus=sim.getCountry(selected),p=paths.get(selected);
    if(p){ctx.fillStyle='rgba(96,191,207,.16)';ctx.fill(p);ctx.strokeStyle='#7ed8e6';ctx.lineWidth=2;ctx.shadowColor='#75dce0';ctx.shadowBlur=12;ctx.stroke(p);ctx.shadowBlur=0;}
    if(hovered && hovered!==selected){const hp=paths.get(hovered);if(hp){ctx.fillStyle='rgba(123,196,207,.1)';ctx.fill(hp);ctx.strokeStyle='#91c6d0';ctx.lineWidth=1.5;ctx.stroke(hp);}}
    if(focus){let [x,y]=project(focus.center); if(x<55)x=55;if(x>w-55)x=w-55;if(y<35)y=35;if(y>h-65)y=h-65;
      const label=focus.localName.toUpperCase();ctx.font='800 11px Inter,Segoe UI,Arial';const tw=ctx.measureText(label).width;
      ctx.fillStyle='#0c2836e8';ctx.fillRect(x-tw/2-10,y-35,tw+20,22);ctx.strokeStyle='#407d91';ctx.lineWidth=.8;ctx.strokeRect(x-tw/2-10,y-35,tw+20,22);
      ctx.fillStyle='#e3f5fb';ctx.textAlign='center';ctx.fillText(label,x,y-24);
      ctx.beginPath();ctx.arc(x,y,6+2*Math.sin(time*.004),0,Math.PI*2);ctx.strokeStyle='#89d5df';ctx.lineWidth=1.3;ctx.stroke();
    }
    // The scale annotations refer to game state and are intentionally not live telemetry.
    ctx.fillStyle='#557a90';ctx.font='10px monospace';ctx.textAlign='right';ctx.fillText('LAT/LON · WORLD 110M',w-18,h-36);
  }
  function hval(seed){const x=Math.sin(seed*127.1+seed*seed*.011)*43758.545;return x-Math.floor(x);}
  function cityGeometry(c){
    if(currentCityCache?.id===c.id)return currentCityCache;
    const roadsX=[.105,.265,.425,.595,.765,.91],roadsY=[.12,.30,.49,.69,.87];
    const buildings=[];const seed=c.citySeed||12345;
    let n=0;
    for(let i=0;i<roadsX.length-1;i++)for(let j=0;j<roadsY.length-1;j++){
      const left=roadsX[i]+.022,top=roadsY[j]+.026,right=roadsX[i+1]-.028,bottom=roadsY[j+1]-.028;
      if(hval(seed+86*n)>.17){
        buildings.push({x:left,y:top,w:right-left,h:bottom-top,kind:hval(seed+48*n),style:hval(seed+11*n),seed:seed+n});
        if(hval(seed+57*n)>.68)buildings.push({x:left+(right-left)*.53,y:top+.01,w:(right-left)*.4,h:(bottom-top)*.43,kind:hval(seed+89*n),style:hval(seed+31*n),seed:seed+200+n});
      }
      n++;
    }
    currentCityCache={id:c.id,roadsX,roadsY,buildings};return currentCityCache;
  }
  function drawCity(time){
    const c=sim.getCountry(selected);if(!c)return;
    const ctx=cctx,g=cityGeometry(c);
    ctx.fillStyle='#0c1920';ctx.fillRect(0,0,w,h);
    const cell=36;ctx.lineWidth=.5;ctx.strokeStyle='rgba(63,95,106,.17)';ctx.beginPath();for(let x=0;x<w;x+=cell){ctx.moveTo(x,0);ctx.lineTo(x,h);}for(let y=0;y<h;y+=cell){ctx.moveTo(0,y);ctx.lineTo(w,y);}ctx.stroke();
    ctx.fillStyle='#243643';for(const x of g.roadsX)ctx.fillRect(x*w-9,0,19,h);for(const y of g.roadsY)ctx.fillRect(0,y*h-9,w,19);
    ctx.strokeStyle='#5973824e';ctx.lineWidth=1;ctx.setLineDash([8,12]);ctx.beginPath();for(const x of g.roadsX){ctx.moveTo(x*w,0);ctx.lineTo(x*w,h);}for(const y of g.roadsY){ctx.moveTo(0,y*h);ctx.lineTo(w,y*h);}ctx.stroke();ctx.setLineDash([]);
    for(const b of g.buildings){
      const x=b.x*w,y=b.y*h,bw=b.w*w,bh=b.h*h;
      ctx.fillStyle=b.kind>.82?'#263f42':b.kind>.56?'#273844':'#1b303b';ctx.fillRect(x+3,y+5,bw,bh);
      ctx.strokeStyle='#47616c';ctx.lineWidth=.75;ctx.strokeRect(x+3,y+5,bw,bh);
      ctx.fillStyle=b.style>.65?'#334b4d':'#344956';ctx.fillRect(x+9,y+9,bw-12,Math.max(5,bh-17));
      ctx.strokeStyle='#56748155';ctx.strokeRect(x+10,y+10,bw-15,Math.max(3,bh-19));
      if(b.kind>.71){ctx.fillStyle='rgba(75,133,124,.32)';ctx.fillRect(x+bw*.24,y+bh*.26,bw*.27,bh*.22);}
    }
    // District labels, approximate and non-geographic.
    ctx.fillStyle='#7799a3a9';ctx.font='700 10px Segoe UI,Arial';ctx.textAlign='center';ctx.fillText('SETOR NORTE',w*.49,h*.19);ctx.fillText('SETOR CENTRAL',w*.49,h*.56);ctx.fillText('ZONA SUL',w*.49,h*.79);
    const active=c.cases;
    const n=clamp(Math.round(8+Math.log10(1+active)*9),8,75);
    for(let i=0;i<n;i++){
      const s=c.citySeed+i*81.71,group=i%3;
      const baseX=[.60,.36,.80][group],baseY=[.32,.57,.64][group];
      const rad=.03+.27*hval(s+4);
      const angle=hval(s+5)*Math.PI*2;
      const shift=time*.000018*(.35+hval(s+6));
      let x=(baseX+Math.cos(angle)*rad+Math.sin(time*.0014+hval(s+4)*9)*.010+shift)%1;
      let y=clamp(baseY+Math.sin(angle)*rad*.78+Math.cos(time*.001+hval(s+6)*9)*.018,.06,.92);
      if(x<.04)x+=.89;
      ctx.beginPath();ctx.arc(x*w,y*h,2.6+(i%3===0?1:0),0,Math.PI*2);ctx.fillStyle='rgba(251,115,93,.82)';ctx.fill();
      if(i%5===0){ctx.beginPath();ctx.arc(x*w,y*h,7+Math.sin(time*.004+i)*2,0,Math.PI*2);ctx.strokeStyle='rgba(226,100,79,.20)';ctx.lineWidth=1;ctx.stroke();}
    }
    for(let i=0;i<55;i++){
      const s=c.citySeed+i*71.67+7;
      const x=clamp(.08+hval(s)*.83 + .01*Math.sin(time*.0008+i),.06,.94);
      const y=clamp(.11+hval(s+8)*.77+.008*Math.cos(time*.0008+i),.09,.91);
      ctx.fillStyle=(i%6===0)?'#d8cea5':'#6ab99c';ctx.fillRect(x*w-1,y*h-1,2.5,2.5);
    }
    for(const u of c.units){
      const info=UNIT_TYPES[u.type],x=u.x*w,y=u.y*h,r=info.radius*(Math.min(w,h)/480);
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=u.type==='evac'?'rgba(83,224,153,.06)':u.type==='barrier'?'rgba(243,185,108,.06)':'rgba(97,188,232,.07)';ctx.fill();
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=info.color+'6a';ctx.lineWidth=1.3;ctx.stroke();
      ctx.beginPath();ctx.arc(x,y,10+Math.sin(time*.002+u.x*10)*1.5,0,Math.PI*2);ctx.fillStyle='#0e2733';ctx.fill();ctx.strokeStyle=info.color;ctx.lineWidth=2;ctx.stroke();
      ctx.font='800 13px Segoe UI,Arial';ctx.fillStyle=info.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(u.type==='squad'?'●':u.type==='barrier'?'▣':'+',x,y+.3);
    }
    const totalUnits=c.units.length;
    ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.font='11px Segoe UI,Arial';
    ctx.fillStyle='rgba(8,19,27,.82)';ctx.fillRect(15,h-105,198,34);
    ctx.fillStyle='#efb4a6';ctx.fillRect(25,h-93,7,7);ctx.fillStyle='#afc8d0';ctx.fillText('Infetados (representação)',39,h-86);
    ctx.fillStyle='rgba(8,19,27,.82)';ctx.fillRect(15,h-68,198,27);
    ctx.fillStyle='#69bf9c';ctx.fillRect(25,h-58,7,7);ctx.fillStyle='#afc8d0';ctx.fillText('Civis · '+totalUnits+' unidades colocadas',39,h-51);
  }
  function updateStats(){
    const g=sim.global,p=sim.player,c=sim.getCountry(selected);
    el('metricCases').textContent=compact(g.infected);el('metricAffected').textContent=`${g.affected} / ${sim.countries.length}`;
    el('metricDeaths').textContent=compact(g.dead);el('metricStability').textContent=g.stability+' / 100';
    el('metricBudget').textContent=money(p.budget);el('metricPlayer').textContent=p.localName+' · País sob comando';
    const d=sim.date;el('topDate').textContent=new Intl.DateTimeFormat('pt-PT',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'}).format(d).toUpperCase();
    el('topDay').textContent='DIA '+String(sim.day+1).padStart(2,'0')+' DA CRISE';
    el('countryName').textContent=c.localName;el('countryCode').textContent=c.id.slice(0,3);el('countryMeta').textContent=(CONTINENTS[c.continent]||c.continent)+' · '+c.id;
    el('countryCases').textContent=fmt(c.cases);el('countryDeaths').textContent=fmt(c.deaths);el('countryDefense').textContent=c.defense+' / 100';el('countryStability').textContent=Math.round(c.stability)+' / 100';
    const pressure=clamp(Math.log10(1+c.cases/c.pop*200000)*25,0,100);
    el('pressureBar').style.width=pressure+'%';
    const severity=c.cases/c.pop;el('pressureLabel').textContent=severity>.03?'CRÍTICA':severity>.003?'MUITO ELEVADA':severity>.0002?'ELEVADA':severity>.00002?'MODERADA':'BAIXA';
    el('boardHeading').textContent=view==='world'?'TEATRO MUNDIAL':'OPERAÇÃO URBANA';
    el('mapChipText').textContent=view==='world'?'Clique num país para consultar o relatório':`Clique no mapa para posicionar ${UNIT_TYPES[selectedUnit].name.toLowerCase()}`;
    el('simulationStatus').textContent=playing?'SIMULAÇÃO EM CURSO':'SIMULAÇÃO EM PAUSA';
    el('cityTitle').innerHTML=esc(c.city.toUpperCase())+' <span>· ÁREA URBANA</span>';
    el('cityStats').textContent=`INFEÇÃO ESTIMADA ${compact(c.cases)}  ·  UNIDADES ${c.units.length}  ·  EVACUADOS ${fmt(c.saved)}`;
    el('mapTopLeft').textContent=view==='world'?'SATELLITE OVERLAY // GLOBAL THREAT':'TACTICAL OVERLAY // URBAN THEATRE';
    el('mapTopRight').textContent=view==='world'?'OBSERVAÇÃO ESTRATÉGICA':'SIMULAÇÃO LOCAL';
    el('mapContext').textContent=view==='world'?`${c.localName} selecionado · ${compact(c.cases)} infetados estimados · Estado ${c.id===sim.playerId?'sob comando':'estrangeiro'}`:`${c.city} · ${c.units.length} unidades posicionadas · a operação afeta a contenção do país`;
    el('playButton').textContent=playing?'Ⅱ PAUSAR':'▶ INICIAR';el('playButton').classList.toggle('playing',playing);
    el('speedButton').textContent=speed+'×';
    updateFinance(c);
    updateActions(c);
    for(const button of document.querySelectorAll('#cityToolbar [data-unit]')){
      const info=UNIT_TYPES[button.dataset.unit];
      button.querySelector('small').textContent=`${money(info.cost)} + ${money(info.daily,3)}/dia`;
      button.title=`${info.name}: colocação ${money(info.cost)}; manutenção ${money(info.daily,3)} por dia`;
    }
  }
  function updateFinance(c){
    const f=sim.getFinance(c.id),last=f.lastDaily;
    const priority=FINANCE_RULES.priority.map(key=>key==='units'?'Operações urbanas':POLICY_TYPES[key].name).join(' → ');
    const services=FINANCE_RULES.priority.filter(key=>key==='units'?c.units.length>0:c[key]);
    const efficacy=services.map(key=>`${key==='units'?'Operações urbanas':POLICY_TYPES[key].name}: ${Math.round(f.effectiveness[key]*100)}%`).join(' · ');
    el('financeTreasury').textContent=money(f.treasury,3);
    el('financeRevenue').textContent=money(f.revenue,3)+'/dia';
    el('financeRequired').textContent=money(f.required,3)+'/dia';
    el('financePaid').textContent=sim.day>0&&last?`${money(last.paid,3)} / ${money(last.due,3)}`:'Sem liquidação diária';
    el('financeArrears').textContent=money(f.arrears,3);
    el('financeEffectiveness').textContent=efficacy||'Sem medidas ou unidades ativas.';
    el('financePriority').textContent=priority+'. O saldo restante paga atrasados.';
    const warnings=[];
    if(f.treasury+f.revenue+1e-9<f.required)warnings.push('A tesouraria e a receita prevista não cobrem a próxima manutenção.');
    if(last?.unpaid>0)warnings.push(`Última liquidação: ${money(last.unpaid,3)} por financiar.`);
    if(services.some(key=>f.effectiveness[key]<1))warnings.push('Capacidade reduzida: a eficácia depende do financiamento.');
    if(f.arrears>0)warnings.push('Existem pagamentos em atraso.');
    el('financeWarning').textContent=warnings.join(' ');
    el('financeWarning').classList.toggle('hidden',warnings.length===0);
  }
  function policyButton(key,detail,c){
    const info=POLICY_TYPES[key],enabled=c[key],effectiveness=sim.getFinance(c.id).effectiveness[key];
    const state=enabled?`Eficácia ${Math.round(effectiveness*100)}% · desativação gratuita`:'Desativada';
    return `<button class="policy-item ${enabled?'on':''}" data-policy="${key}" aria-pressed="${enabled}"><span class="policy-text"><b>${esc(info.name)}</b><small>${detail}</small><small class="policy-cost">Ativação ${money(info.activation)} · ${money(info.daily,3)}/dia</small><small>${state}</small></span><span class="switch"><i></i></span></button>`;
  }
  function updateActions(c){
    let html='';
    if(c.id===sim.playerId){
      html+=`<div class="action-heading"><span>MEDIDAS DO GOVERNO</span><small>CONTROLO DIRETO</small></div>`;
      html+=policyButton('borders','Reduz importações · prejudica comércio',c);
      html+=policyButton('emergency','Reduz transmissão · afeta economia',c);
      html+=policyButton('mobilized','Aumenta contenção · custo contínuo',c);
      html+=`<p class="country-blurb">Cada ativação é paga; manutenção por dia, segundo a prioridade indicada acima. Reforça a resposta local no separador <b>Cidade / Operações</b>.</p>`;
      html+=`<button class="action-button secondary" data-action="city">ABRIR OPERAÇÃO EM ${esc(c.city.toUpperCase())}</button>`;
    }else{
      html+=`<div class="action-heading"><span>RELAÇÕES INTERNACIONAIS</span><small>PAÍS ESTRANGEIRO</small></div>`;
      html+=`<p class="country-blurb">Relação diplomática simulada com o teu país: <b>${Math.round(c.relations)}/100</b><br>Orçamento estimado de crise: <b>${money(c.budget)}</b><br>Colaboração humanitária: <b>${c.aidDays>0?c.aidDays+' dias ativos':'Sem apoio ativo'}</b></p>`;
      html+=`<button class="action-button" data-action="aid">ENVIAR AJUDA HUMANITÁRIA · ${money(FINANCE_RULES.aidCost)}</button>`;
      html+=`<button class="action-button secondary" data-action="control">ASSUMIR COMANDO DE ${esc(c.localName.toUpperCase())}</button>`;
      html+=`<button class="action-button secondary" data-action="city">OBSERVAR ${esc(c.city.toUpperCase())}</button>`;
    }
    el('countryActions').innerHTML=html;
  }
  function updateEvents(){
    el('eventList').innerHTML=sim.history.slice(0,28).map(e=>`<div class="event"><div class="event-date">DIA ${String(e.day+1).padStart(2,'0')}</div><div class="event-topic ${esc(e.type)}">${esc(e.topic)}</div><div class="event-msg">${esc(e.message)}</div></div>`).join('');
  }
  function toast(message,error=false){
    clearTimeout(toastTimer);const t=el('toast');t.textContent=message;t.classList.toggle('error',error);t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),2600);
  }
  function refresh(){updateStats();updateEvents();}
  function handleResult(out){if(out?.message)toast(out.message,!out.ok);refresh();}
  function setView(v){view=v==='city'?'city':'world';worldCanvas.classList.toggle('hidden',view!=='world');cityCanvas.classList.toggle('hidden',view!=='city');
    el('worldTab').classList.toggle('active',view==='world');el('cityTab').classList.toggle('active',view==='city');
    el('cityToolbar').classList.toggle('hidden',view!=='city');el('cityHud').classList.toggle('hidden',view!=='city');
    el('worldLegend').classList.toggle('hidden',view!=='world');
    el('mapChip').classList.toggle('hidden',view==='city');
    el('tooltip').classList.add('hidden');hovered=null;size();refresh();}
  function choose(id){if(!sim.getCountry(id))return;selected=id;currentCityCache=null;refresh();}
  function coordinate(ev){const rect=AREA.getBoundingClientRect();return {x:ev.clientX-rect.left,y:ev.clientY-rect.top,rect};}
  worldCanvas.addEventListener('mousemove',ev=>{
    const {x,y}=coordinate(ev),hit=[...sim.countries].reverse().find(c=>wctx.isPointInPath(paths.get(c.id),x,y));
    hovered=hit?.id||null;worldCanvas.style.cursor=hovered?'pointer':'default';
    const tooltip=el('tooltip');
    if(hit){tooltip.classList.remove('hidden');tooltip.style.left=clamp(x+13,8,w-188)+'px';tooltip.style.top=clamp(y-15,28,h-55)+'px';tooltip.innerHTML=`<strong>${esc(hit.localName)}</strong><span>${fmt(hit.cases)} infetados estimados</span>`;}
    else tooltip.classList.add('hidden');
  });
  worldCanvas.addEventListener('mouseleave',()=>{hovered=null;el('tooltip').classList.add('hidden');});
  worldCanvas.addEventListener('click',ev=>{const {x,y}=coordinate(ev);const hit=[...sim.countries].reverse().find(c=>wctx.isPointInPath(paths.get(c.id),x,y));if(hit)choose(hit.id);});
  cityCanvas.addEventListener('click',ev=>{
    if(selected!==sim.playerId)return toast('Assume o comando deste país antes de posicionar unidades.',true);
    const {x,y}=coordinate(ev);const nx=x/w,ny=y/h;
    if(ny<.15||ny>.88)return toast('Seleciona uma posição dentro da área operacional.',true);
    handleResult(sim.deployUnit(selectedUnit,nx,ny));
  });
  el('countryActions').addEventListener('click',ev=>{
    const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.policy)handleResult(sim.togglePolicy(b.dataset.policy));
    else if(b.dataset.action==='aid')handleResult(sim.sendAid(selected));
    else if(b.dataset.action==='control')handleResult(sim.takeControl(selected));
    else if(b.dataset.action==='city')setView('city');
  });
  el('cityToolbar').addEventListener('click',ev=>{let b=ev.target.closest('[data-unit]');if(!b)return;selectedUnit=b.dataset.unit;for(const x of document.querySelectorAll('[data-unit]'))x.classList.toggle('selected',x===b);refresh();});
  el('worldTab').addEventListener('click',()=>setView('world'));el('cityTab').addEventListener('click',()=>setView('city'));
  el('stepButton').addEventListener('click',()=>{sim.advance();refresh();});
  el('playButton').addEventListener('click',()=>{playing=!playing;lastTick=performance.now();refresh();});
  el('speedButton').addEventListener('click',()=>{speed=speed===1?4:1;refresh();});
  el('resetButton').addEventListener('click',()=>{sim=new SimEngine(window.WORLD_DATA);selected=sim.playerId;playing=false;speed=1;selectedUnit='squad';lastTick=performance.now();makePaths();setView('world');toast('Cenário reiniciado.');});
  function modal(show){el('helpModal').classList.toggle('hidden',!show);}
  el('helpButton').addEventListener('click',()=>modal(true));el('closeHelp').addEventListener('click',()=>modal(false));el('startHelp').addEventListener('click',()=>modal(false));
  el('helpModal').addEventListener('click',ev=>{if(ev.target===el('helpModal'))modal(false);});
  document.addEventListener('keydown',ev=>{if(ev.code==='Space'&&el('helpModal').classList.contains('hidden')){ev.preventDefault();playing=!playing;lastTick=performance.now();refresh();} if(ev.code==='Escape')modal(false);});
  function frame(time){
    if(playing && time-lastTick>=(speed===1?1400:350)){
      const step=Math.min(6,Math.floor((time-lastTick)/(speed===1?1400:350)));
      for(let i=0;i<step;i++)sim.advance();
      lastTick=time;refresh();
    }
    if(time-lastDraw>=30){lastDraw=time;size();if(view==='world')drawWorld(time);else drawCity(time);}
    requestAnimationFrame(frame);
  }
  size();refresh();requestAnimationFrame(frame);
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>size()).observe(AREA);
})();
