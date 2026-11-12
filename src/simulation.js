/* Crisis Vector — fictional simulation engine. No external dependencies. */
(function (root) {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = n => Number(n).toLocaleString('pt-PT');
  // Money is settled in integer thousandths of a fictional B€.
  const minor = n => Math.round(n * 1000);
  const money = n => minor(n) / 1000;
  const owns = (object, key) => typeof key === 'string' && Object.hasOwn(object, key);
  const POLICY_TYPES = Object.freeze({
    borders: Object.freeze({name:'Controlo de fronteiras', activation:.5, daily:.04}),
    emergency: Object.freeze({name:'Estado de emergência', activation:.8, daily:.085}),
    mobilized: Object.freeze({name:'Mobilização militar', activation:1.2, daily:.18})
  });
  const FINANCE_RULES = Object.freeze({
    priority:Object.freeze(['emergency','units','mobilized','borders']),
    effectivenessStep:.25, aidCost:.8, maxAdvanceDays:3650
  });
  const CITY = { PRT:'Lisboa',ESP:'Madrid',FRA:'Paris',DEU:'Berlim',GBR:'Londres',USA:'Nova Iorque',BRA:'São Paulo',IND:'Nova Deli',CHN:'Xangai',JPN:'Tóquio',ITA:'Roma',RUS:'Moscovo',TUR:'Istambul',ZAF:'Cidade do Cabo',AUS:'Sydney',CAN:'Toronto',MEX:'Cidade do México',ARG:'Buenos Aires',KOR:'Seul',UKR:'Kyiv',EGY:'Cairo',IDN:'Jacarta',NGA:'Lagos',PAK:'Carachi' };
  const LOCAL = { PRT:'Portugal',ESP:'Espanha',FRA:'França',DEU:'Alemanha',GBR:'Reino Unido',USA:'Estados Unidos',BRA:'Brasil',IND:'Índia',CHN:'China',JPN:'Japão',ITA:'Itália',RUS:'Rússia',TUR:'Turquia',ZAF:'África do Sul',AUS:'Austrália',CAN:'Canadá',MEX:'México',ARG:'Argentina',KOR:'Coreia do Sul',UKR:'Ucrânia',EGY:'Egito',IDN:'Indonésia',NGA:'Nigéria',PAK:'Paquistão',SWE:'Suécia',NOR:'Noruega',POL:'Polónia',IRN:'Irão' };
  const SEEDS = { IND:76000, CHN:9000, ESP:2800, BRA:1400, TUR:1100, USA:480, ITA:420, ZAF:350, GBR:300, FRA:180, PRT:105, JPN:60, DEU:45, AUS:12 };
  const UNIT_TYPES = Object.freeze({
    squad: Object.freeze({ name:'Infantaria', cost:0.35, daily:.015, power:2.6, relief:0.7, color:'#69baff', radius:44 }),
    barrier: Object.freeze({ name:'Barreira', cost:0.22, daily:.01, power:1.5, relief:0.5, color:'#ffd27a', radius:57 }),
    evac: Object.freeze({ name:'Evacuação', cost:0.45, daily:.02, power:0.45, relief:3.0, color:'#69e3b3', radius:55 })
  });
  class SimEngine {
    constructor(data, seed=16927) {
      this._seed = seed >>> 0;
      this.day = 0;
      this.history = [];
      this._eventId = 0;
      this.playerId = 'PRT';
      this.countries = data.map(d => {
        const gdp = Math.max(100, Number(d.gdp) || 1000);
        const pop = Math.max(10000, Number(d.pop) || 1000000);
        const perCap = gdp * 1e6 / pop;
        const prosperity = clamp((Math.log10(Math.max(100,perCap)) - 2.3) / 2.8, .07, 1);
        const infrastructure = clamp(Math.round(25 + prosperity*62), 20, 92);
        const defense = clamp(Math.round(14 + prosperity*34 + 6*Math.log10(Math.max(1, gdp/10000))), 14, 83);
        return {...d, localName: LOCAL[d.id] || d.name, city:CITY[d.id] || ('Área urbana de '+(LOCAL[d.id] || d.name)),
          cases:SEEDS[d.id] || 0, deaths:0, saved:0, infrastructure, defense,
          budget: Math.max(.55, Math.round(gdp*.055/1000*10)/10),
          economy:100, stability: clamp(Math.round(59+prosperity*35), 51, 94),
          trust: clamp(Math.round(35+prosperity*30 + (this.random()-.5)*18),20,85),
          relations: clamp(Math.round(48 + (this.random()-.5)*25),20,80),
          borders:false, emergency:false, mobilized:false, aidDays:0,
          units:[], citySeed:Math.floor(this.random()*1000000), _alertStage:0 };
      });
      this.byId = Object.fromEntries(this.countries.map(c=>[c.id,c]));
      for (const c of this.countries) c.finance = {
        initialTreasury:c.budget, totalRevenue:0, totalSpent:0,
        totalOperatingDue:0, totalOperatingPaid:0, totalArrearsPaid:0, arrears:0,
        effectiveness:{emergency:0, units:0, mobilized:0, borders:0}, lastDaily:null
      };
      if(!this.byId[this.playerId]) this.playerId = this.countries[0].id;
      this.log('CENTRO DE OPERAÇÕES','Foram confirmados focos de infeção em vários continentes. A comunidade internacional reúne-se em sessão de emergência.','alert');
      this.log('SITUAÇÃO NACIONAL',`O governo de ${this.player.localName} recebeu os primeiros relatórios. As autoridades aguardam ordens.`, 'info');
    }
    random(){this._seed=(Math.imul(1664525,this._seed)+1013904223)>>>0;return this._seed/4294967296;}
    get player(){return this.byId[this.playerId];}
    getCountry(id){return owns(this.byId,id) ? this.byId[id] : null;}
    get date(){let d=new Date(Date.UTC(2027,2,15));d.setUTCDate(d.getUTCDate()+this.day);return d;}
    log(topic, message, type='info', details=null){
      this.history.unshift({id:++this._eventId,day:this.day,topic,message,type,details});
      if(this.history.length>80)this.history.length=80;
    }
    get global(){let infected=0,dead=0,affected=0,stability=0;
      for(const c of this.countries){infected+=c.cases;dead+=c.deaths; if(c.cases>0)affected++; stability+=c.stability;}
      return {infected:Math.round(infected),dead:Math.round(dead),affected,stability:Math.round(stability/this.countries.length)};
    }
    togglePolicy(key){
      if(!owns(POLICY_TYPES,key))return {ok:false,message:'Política desconhecida.'};
      return this._setPolicy(this.playerId,key,!this.player[key]);
    }
    // Both AI and player commands enter the same validation/payment path.
    _setPolicy(id,key,enabled){
      const c=this.getCountry(id);
      if(!c || !owns(POLICY_TYPES,key) || typeof enabled!=='boolean')return {ok:false,message:'Medida inválida.'};
      if(c[key]===enabled)return {ok:false,message:'Medida já neste estado.'};
      const rule=POLICY_TYPES[key], cost=enabled?rule.activation:0;
      if(!this._spend(c,cost))return {ok:false,message:'Orçamento insuficiente para esta medida.'};
      c[key]=enabled;
      // Activation pays for mobilization, not a refill of degraded capacity.
      // Initial capacity recovers only through daily funded operations.
      this.log('DECISÃO GOVERNAMENTAL',`${c.localName}: ${rule.name} ${enabled?'ativado':'desativado'}; custo ${fmt(cost)} B€, manutenção ${fmt(enabled?rule.daily:0)} B€/dia.`,enabled?'action':'info',
        {countryId:id,policy:key,enabled,cost,daily:enabled?rule.daily:0});
      return {ok:true,message:enabled?'Medida implementada; eficácia depende do financiamento diário.':'Medida terminada; atrasados mantidos.'};
    }
    _spend(c,cost){
      if(!Number.isFinite(c.budget) || c.budget<cost)return false;
      c.budget=(minor(c.budget)-minor(cost))/1000;
      c.finance.totalSpent=money(c.finance.totalSpent+cost);
      return true;
    }
    _revenue(c){
      // An abstract domestic tax base, not a transfer from another government.
      return money(Math.max(.002,c.gdp/10000000)*c.economy/100);
    }
    _requirements(c){
      return {
        emergency:c.emergency?POLICY_TYPES.emergency.daily:0,
        units:money(c.units.reduce((sum,u)=>sum+UNIT_TYPES[u.type].daily,0)),
        mobilized:c.mobilized?POLICY_TYPES.mobilized.daily:0,
        borders:c.borders?POLICY_TYPES.borders.daily:0
      };
    }
    getFinance(id=this.playerId){
      const c=this.getCountry(id); if(!c)return null;
      const f=c.finance;
      return {treasury:c.budget,revenue:this._revenue(c),
        required:money(Object.values(this._requirements(c)).reduce((a,b)=>a+b,0)),
        arrears:f.arrears,effectiveness:{...f.effectiveness},
        lastDaily:f.lastDaily?{...f.lastDaily,services:Object.fromEntries(Object.entries(f.lastDaily.services).map(([k,v])=>[k,{...v}]))}:null};
    }
    _settleFinance(c){
      const f=c.finance, opening=minor(c.budget), revenue=minor(this._revenue(c));
      const arrearsOpening=minor(f.arrears), required=this._requirements(c), services={};
      let available=opening+revenue, due=0, paid=0;
      for(const key of FINANCE_RULES.priority){
        const need=minor(required[key]), allocation=Math.min(available,need);
        available-=allocation;due+=need;paid+=allocation;
        const funding=need?allocation/need:0;
        const previous=f.effectiveness[key];
        const effectiveness=need?clamp(funding,Math.max(0,previous-FINANCE_RULES.effectivenessStep),Math.min(1,previous+FINANCE_RULES.effectivenessStep)):0;
        f.effectiveness[key]=effectiveness;
        services[key]={due:need/1000,paid:allocation/1000,funding,effectiveness};
      }
      const unpaid=due-paid;
      // Past obligations are paid after today's services; never pay twice or
      // grant today's efficacy for repayment of a past service shortfall.
      const arrearsPaid=Math.min(available,arrearsOpening);
      available-=arrearsPaid;
      c.budget=available/1000;
      f.arrears=(arrearsOpening+unpaid-arrearsPaid)/1000;
      f.totalRevenue=money(f.totalRevenue+revenue/1000);
      f.totalSpent=money(f.totalSpent+(paid+arrearsPaid)/1000);
      f.totalOperatingDue=money(f.totalOperatingDue+due/1000);
      f.totalOperatingPaid=money(f.totalOperatingPaid+paid/1000);
      f.totalArrearsPaid=money(f.totalArrearsPaid+arrearsPaid/1000);
      f.lastDaily={day:this.day,opening:opening/1000,revenue:revenue/1000,due:due/1000,paid:paid/1000,unpaid:unpaid/1000,
        arrearsOpening:arrearsOpening/1000,arrearsPaid:arrearsPaid/1000,closing:c.budget,services};
      if(c.id===this.playerId)this.log('FINANCIAMENTO',`${c.localName}: receitas ${fmt(revenue/1000)} B€; operações ${fmt(paid/1000)} / ${fmt(due/1000)} B€; atrasados ${fmt(f.arrears)} B€.`,unpaid?'alert':'info',
        {countryId:c.id,...f.lastDaily,arrears:f.arrears});
    }
    takeControl(id){
      const c=this.getCountry(id); if(!c)return {ok:false,message:'País indisponível.'};
      this.playerId=id;this.log('TRANSFERÊNCIA DE COMANDO',`Passaste a coordenar a resposta de ${c.localName}.`,'action');
      return {ok:true,message:'Controlo transferido.'};
    }
    sendAid(id){
      const target=this.getCountry(id), src=this.player, cost=FINANCE_RULES.aidCost;
      if(!target||target.id===src.id)return {ok:false,message:'Seleciona outro país.'};
      if(!this._spend(src,cost))return {ok:false,message:'Recursos insuficientes para ajuda humanitária.'};
      src.trust=clamp(src.trust+2,0,100);
      target.aidDays=Math.max(target.aidDays,8); target.stability=clamp(target.stability+2,0,100);target.relations=clamp(target.relations+10,0,100);
      this.log('DIPLOMACIA',`${src.localName} enviou ajuda humanitária para ${target.localName}: ${fmt(cost)} B€. Cooperação reforçada por 8 dias.`, 'success', {countryId:src.id,targetId:id,cost});
      return {ok:true,message:'Ajuda enviada. Reforço temporário de contenção.'};
    }
    deployUnit(type,x,y){
      if(!owns(UNIT_TYPES,type))return {ok:false,message:'Unidade desconhecida.'};
      if(!Number.isFinite(x)||!Number.isFinite(y)||x<.04||x>.96||y<.06||y>.94)return {ok:false,message:'Coordenadas inválidas: x entre 0,04 e 0,96; y entre 0,06 e 0,94.'};
      const info=UNIT_TYPES[type], c=this.player;
      if(c.units.length>=26)return {ok:false,message:'Limite operacional local atingido.'};
      if(!this._spend(c,info.cost))return {ok:false,message:'Recursos insuficientes.'};
      const obj={id:this._eventId+1, type, x,y,day:this.day};c.units.push(obj);
      this.log('OPERAÇÃO URBANA',`${c.city}: ${info.name.toLowerCase()} posicionada; custo ${fmt(info.cost)} B€, manutenção ${fmt(info.daily)} B€/dia.`, 'action', {countryId:c.id,unitId:obj.id,unitType:type,cost:info.cost,daily:info.daily});
      return {ok:true,message:`${info.name} mobilizada com sucesso.`};
    }
    advance(days=1){
      if(!Number.isSafeInteger(days)||days<1||days>FINANCE_RULES.maxAdvanceDays||!Number.isSafeInteger(this.day+days))return {ok:false,message:`Avança entre 1 e ${FINANCE_RULES.maxAdvanceDays} dias inteiros.`};
      for(let day=0;day<days;day++)this._step();
      return this.global;
    }
    _step(){
      this.day++;
      for(const c of this.countries){
        if(c.id!==this.playerId){
          const rel=c.cases/c.pop;
          if(!c.emergency && rel>.00022 && c.stability>30 && this.random()<.24)this._setPolicy(c.id,'emergency',true);
          if(!c.borders && rel>.000035 && c.economy>58 && this.random()<.22)this._setPolicy(c.id,'borders',true);
          if(!c.mobilized && rel>.0015 && this.random()<.18)this._setPolicy(c.id,'mobilized',true);
        }
        this._settleFinance(c);
      }
      // All governments have settled funding before a single propagation pass.
      const old=this.countries.map(c=>({...c,finance:{effectiveness:{...c.finance.effectiveness}}}));
      const hot=old.filter(c=>c.cases>200).sort((a,b)=>b.cases-a.cases).slice(0,16);
      for(const c of this.countries){
        const eff=c.finance.effectiveness;
        const emergency=c.emergency?eff.emergency:0, mobilized=c.mobilized?eff.mobilized:0, borders=c.borders?eff.borders:0;
        let imports=0;
        for(const source of hot){if(source.id===c.id)continue;
          const dist=distanceKm(source.center,c.center);
          // Most contagion moves through regional connections. Intercontinental
          // imports are uncommon and require economically connected hubs.
          const regional = Math.exp(-dist/1950)*(source.continent===c.continent?1:.38);
          const airHub = source.gdp>700000 && c.gdp>300000 ? .004 : .0002;
          const ports = clamp(Math.sqrt(Math.max(100,c.gdp)/100000),.17,1.8);
          const risk = Math.sqrt(source.cases/10000) * (regional*.058+airHub) * ports *
            (1-.90*borders) * (1-.60*(source.borders?source.finance.effectiveness.borders:0));
          imports+=risk;
        }
        if(c.continent==='Seven seas (open ocean)') imports=0;
        const incoming=Math.floor(imports)+(this.random()<imports%1?1:0);
        const unitsPower=c.units.reduce((acc,u)=>acc+UNIT_TYPES[u.type].power,0)*eff.units;
        const relief=clamp(unitsPower*.009,0,.18);
        const containment=clamp(.48*emergency + .16*mobilized + (c.aidDays>0?.11:0) + relief,0,.83);
        const growth=Math.round(c.cases * (.115 * (1-containment)) * (.89+this.random()*.22));
        const kills=Math.round(c.cases*(.015+c.defense*.00036)*(1+.65*mobilized)*(1+relief*.45));
        // Civilian losses are abstracted; this is not a clinical epidemiological model.
        const newlyDead=Math.min(c.pop-c.deaths, Math.round(c.cases*(.0017+(1-c.infrastructure/100)*.0028)*(1-.18*emergency)));
        c.deaths+=newlyDead;
        const newCases = clamp(c.cases + growth + incoming - kills, 0, c.pop-c.deaths);
        c.cases=Math.round(newCases);
        const evacUnits=c.units.filter(u=>u.type==='evac').length;
        c.saved+=Math.round(evacUnits * eff.units * (8+this.random()*11)*(1+Math.log10(1+c.cases)*.2));
        c.economy=clamp(c.economy-.16*borders-.23*emergency-Math.min(.5,c.cases/c.pop*140) + .035,0,100);
        const shortfall=c.finance.lastDaily.due?c.finance.lastDaily.unpaid/c.finance.lastDaily.due:0;
        c.stability=clamp(c.stability-Math.min(1.8,c.cases/c.pop*105)-.09*emergency-.15*shortfall+(c.aidDays>0?.035:0)+ (c.cases===0?.035:0),0,100);
        if(c.aidDays>0)c.aidDays--;
        const ratio=c.cases/c.pop;
        const stage=ratio>=.1?4:ratio>=.01?3:ratio>=.001?2:ratio>=.0001?1:0;
        if(stage>c._alertStage){
          c._alertStage=stage;
          if(stage>=2 || c.id===this.playerId)this.log('ALERTA EPIDEMIOLÓGICO',`${c.localName}: infeção alcançou ${(ratio*100).toFixed(2).replace('.',',')}% da população.`,stage>=3?'alert':'info');
        }
      }
      if(this.day===5)this.log('CIMEIRA INTERNACIONAL','A comunidade internacional debate corredores humanitários e restrições de circulação.', 'info');
      if(this.day===14)this.log('INTELIGÊNCIA E DEFESA','Os serviços de informações alertam para falhas na cadeia logística e na comunicação entre governos.', 'alert');
      if(this.day%7===0){const g=this.global;
        this.log('RELATÓRIO SEMANAL',`Existem ${fmt(g.infected)} infetados estimados em ${g.affected} países. ${fmt(g.dead)} vítimas acumuladas.`,g.infected>800000?'alert':'info');
      }
    }
  }
  function distanceKm(a,b){
    let x=(a[0]-b[0])*Math.PI/180, y=(a[1]-b[1])*Math.PI/180;
    const s=Math.sin(y/2)**2+Math.cos(a[1]*Math.PI/180)*Math.cos(b[1]*Math.PI/180)*Math.sin(x/2)**2;
    return 12742*Math.asin(Math.min(1,Math.sqrt(s)));
  }
  const api={SimEngine,UNIT_TYPES,POLICY_TYPES,FINANCE_RULES,distanceKm,clamp,fmt};
  root.CrisisSim=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
